import { ModelMessage } from 'ai';
import { Schema, model, type Document, type Model } from 'mongoose';

export interface IAgentMemory extends Document {
  userId: Schema.Types.ObjectId;
  messages: Array<{
    message: ModelMessage;
    timestamp: Date;
  }>;
}


const agentMemorySchema = new Schema<IAgentMemory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [{
      message: { type: Object, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const AgentMemory: Model<IAgentMemory> = model<IAgentMemory>('AgentMemory', agentMemorySchema);
