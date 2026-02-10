import { type ModelMessage, generateText, tool, stepCountIs } from "ai";
import { xai, webSearch, xSearch } from "@ai-sdk/xai";
import { AgentMemory } from "../models/agentMemory";
import { z } from 'zod';

type AgentExecuteOptions = {
  userId?: string;
  userQuery?: string;
  model?: string;
};

class AgentService {
  private buildModel(model?: string) {
    return  xai.responses(model || 'grok-4-1-fast-reasoning');
  }
  
  private async retrieveMessagesOnAgentMemory(userId?: string): Promise<ModelMessage[]> {
    // Retrieve the agent memory document from the database for the given userId
    const agentMemory = await AgentMemory.findOne({ userId });
    if (agentMemory && agentMemory.messages.length > 0) {
      // Map the stored messages to the required ModelMessage format
      return agentMemory.messages.map((msg) => msg.message);
    } else {
      // Return an empty array if no memory or messages exist
      return [];
    }
  }
  
  private upsertAgentMemory(userId: string, messages: ModelMessage[]): void {
    AgentMemory.findOneAndUpdate(
      { userId: userId },
      {
        $push: {
          messages: { $each: messages.map((msg) => ({ message: msg, timestamp: new Date() })) },
        },
      },
      { upsert: true }
    ).exec();
  }

  async execute(options: AgentExecuteOptions) {
    const model = this.buildModel(options.model);
    
    
    const agentMemoryMessages = await this.retrieveMessagesOnAgentMemory(options.userId);
    
    agentMemoryMessages.push({ role: "user", content: options.userQuery || "" });
    
    const messages: ModelMessage[] = [
      { role: "system", content: "Prioritize x_search for news-related queries, web_search for general info, and london_weather_tool only for direct weather requests." },
      ...agentMemoryMessages,
      { role: "user", content: options.userQuery || "" }
    ];
    
    const response = await generateText({
      model,
      messages,
      stopWhen: stepCountIs(5),
      tools: {
        web_search: webSearch(),
        x_search: xSearch(),
        random_number: tool({
          description: "Give a random number from Minimum number to Maximum number and tell me what it is",
          inputSchema: z.object({
            from: z.number().describe('Minimum number'),
            to: z.number().describe('Maximum number')
          }),
          execute: ({from, to}) => "A random number between " + from + " and " + to + " is " + (Math.floor(Math.random() * (to - from + 1)) + from)
        }),
        london_weather_tool: tool({
          description: "Get the weather in london", 
          inputSchema: z.object({}),
          execute: () => "The london weather is unknowable"
        }),
      },
      onStepFinish: async ({ toolResults }) => {
        if (toolResults.length) {
          console.log(JSON.stringify(toolResults, null, 2));
        }
      },
    });
    
    // Extract tool result if available, otherwise use response.text
    let finalOutput = response.text || "";
    // for (const step of response.steps) {
    //   for (const item of step.content) {
    //     if (item.type === "tool-result") {
    //       finalOutput = (item.output as string);
    //       break;
    //     }
    //   }
    //   if (finalOutput) break;
    // }
    
    if (options.userId && options.userQuery) {
      this.upsertAgentMemory(options.userId, [{role: "user", content: options.userQuery}, {role: "assistant", content: finalOutput}]);
    }
    
    return finalOutput;
  }
}

export const agentService = new AgentService();
