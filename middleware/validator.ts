// Middleware de validação com Zod
import { Request, Response, NextFunction } from "express";
import { z, ZodTypeAny } from "zod";

interface ValidatedRequest extends Request {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
}

/**
 * Factory para criar middleware de validação de requests
 */
export function validateRequest(schema: z.ZodObject<{
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedReq = req as ValidatedRequest;
      
      // Valida body, query e params separadamente
      if (schema.shape.body) {
        validatedReq.validatedBody = schema.shape.body.parse(req.body);
      }
      if (schema.shape.query) {
        validatedReq.validatedQuery = schema.shape.query.parse(req.query);
      }
      if (schema.shape.params) {
        validatedReq.validatedParams = schema.shape.params.parse(req.params);
      }

      // Adiciona dados validados ao request
      if (validatedReq.validatedBody) req.body = validatedReq.validatedBody;
      if (validatedReq.validatedQuery) req.query = validatedReq.validatedQuery;
      if (validatedReq.validatedParams) req.params = validatedReq.validatedParams;

      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Dados inválidos na requisição",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Schemas comuns para reutilização
 */
export const schemas = {
  createProject: z.object({
    body: z.object({
      prompt: z.string().min(5).max(500),
      workspaceName: z.string().optional(),
    }),
  }),
  
  generateTasks: z.object({
    body: z.object({
      prompt: z.string().min(5).max(500),
      projectName: z.string().optional(),
      existingTasks: z.array(z.any()).optional(),
    }),
  }),
  
  summarizeProject: z.object({
    body: z.object({
      project: z.object({}).passthrough(),
      tasks: z.array(z.any()),
    }),
  }),
  
  command: z.object({
    body: z.object({
      command: z.string().min(1).max(300),
      currentContext: z.object({}).passthrough().optional(),
    }),
  }),
};
