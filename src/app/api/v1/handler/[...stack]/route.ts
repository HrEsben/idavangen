import { stackServerApp } from "../../../../stack.config";
import { StackHandler } from "@stackframe/stack";

export const GET = StackHandler(stackServerApp);
export const POST = StackHandler(stackServerApp);
