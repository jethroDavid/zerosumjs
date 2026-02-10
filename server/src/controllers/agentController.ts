import { type Request, type Response, type NextFunction } from "express";
import { agentService } from "../services/agentService";

export const simpleAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agentResponse = await agentService.execute({
      userId: req.userId,
      userQuery: req.body.userQuery
    });

    res.json({ agentResponse });
  } catch (error) {
    next(error);
  }
};