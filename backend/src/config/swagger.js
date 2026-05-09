import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DentalCare+ API",
      version: "1.0.0",
      description:
        "REST API for the DentalCare+ dental care platform. Supports patient mobile app, doctor web portal, and admin web portal.",
    },
    servers: [
      { url: "http://localhost:4000", description: "Local development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Patient: {
          type: "object",
          properties: {
            _id:    { type: "string" },
            name:   { type: "string" },
            email:  { type: "string" },
            phone:  { type: "string" },
            age:    { type: "integer" },
            gender: { type: "string", enum: ["male", "female", "other"] },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            _id:            { type: "string" },
            fullName:       { type: "string" },
            email:          { type: "string" },
            phone:          { type: "string" },
            specialization: { type: "string" },
            hospital:       { type: "string" },
            experience:     { type: "integer" },
            services:       { type: "array", items: { type: "string" } },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            _id:       { type: "string" },
            patient:   { type: "string", description: "Patient ID" },
            doctor:    { type: "string", description: "Doctor ID" },
            startTime: { type: "string", format: "date-time" },
            status:    { type: "string", enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"] },
            notes:     { type: "string" },
          },
        },
        Bill: {
          type: "object",
          properties: {
            _id:        { type: "string" },
            billNumber: { type: "string" },
            patient:    { type: "string" },
            doctor:     { type: "string" },
            service:    { type: "string" },
            total:      { type: "number" },
            status:     { type: "string", enum: ["pending", "paid", "cancelled", "overdue"] },
            dueDate:    { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
