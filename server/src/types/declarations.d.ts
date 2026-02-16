// Type declarations for modules without TypeScript definitions
declare module 'express' {
  import { EventEmitter } from 'events';
  import { Server } from 'http';

  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
    cookies: any;
    file?: any;
    files?: any;
    user?: any;
    apiPartner?: any;
    clearCookie?: (name: string, options?: any) => void;
    cookie?: (name: string, value: any, options?: any) => void;
  }

  export interface Response {
    status: (code: number) => Response;
    json: (body: any) => Response;
    send: (body: any) => Response;
    cookie: (name: string, value: any, options?: any) => Response;
    clearCookie: (name: string, options?: any) => Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Application extends EventEmitter {
    use: (path: string | any, handler?: any) => Application;
    listen: (port: number, callback?: () => void) => Server;
    get: (path: string, ...handlers: any[]) => Application;
    post: (path: string, ...handlers: any[]) => Application;
    put: (path: string, ...handlers: any[]) => Application;
    delete: (path: string, ...handlers: any[]) => Application;
    patch: (path: string, ...handlers: any[]) => Application;
  }

  export interface Router {
    use: (middleware: any) => Router;
    get: (path: string, ...handlers: any[]) => Router;
    post: (path: string, ...handlers: any[]) => Router;
    put: (path: string, ...handlers: any[]) => Router;
    delete: (path: string, ...handlers: any[]) => Router;
    patch: (path: string, ...handlers: any[]) => Router;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }

  export interface Express {
    json: () => any;
    urlencoded: (options: { extended: boolean }) => any;
    static: (path: string, options?: any) => any;
  }

  export function Router(): Router;
  
  // Make the default export callable
  const express: () => Application & { 
    json: () => any;
    urlencoded: (options: { extended: boolean }) => any;
    static: (path: string, options?: any) => any;
    Router: () => Router;
  };
  export default express;
}

declare module 'cors';
declare module 'cookie-parser';
declare module 'dotenv';

// Add mongoose model static method declarations
declare module 'mongoose' {
  interface Model<T> {
    updateCauseAmount?: (causeId: any, amount: number) => Promise<any>;
  }
}
