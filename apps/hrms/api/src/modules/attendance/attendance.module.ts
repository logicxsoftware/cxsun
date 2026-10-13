import type { FastifyInstance, FastifyRequest } from "fastify";
import { registerAttendanceRoutes } from "./attendance.routes.js";
import type { AttendanceContext } from "./attendance.types.js";

export const attendanceModule = {
  key: "hrms.attendance",
  register: (
    app: FastifyInstance,
    context: (request: FastifyRequest) => Promise<AttendanceContext>
  ) => registerAttendanceRoutes(app, context)
};
