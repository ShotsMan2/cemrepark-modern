import { apiHandler } from "../apiHandler";
import { NextResponse } from "next/server";
import logger from "../logger";

jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => {
        return { body, status: init?.status };
      }),
    },
  };
});

jest.mock("../logger", () => ({
  error: jest.fn(),
}));

describe("apiHandler", () => {
  let req;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { url: "http://localhost/api/test", method: "GET" };
  });

  it("should call the handler and return its result when no error occurs", async () => {
    const mockResponse = { success: true };
    const handler = jest.fn().mockResolvedValue(mockResponse);
    const wrappedHandler = apiHandler(handler);

    const result = await wrappedHandler(req, "arg1", "arg2");

    expect(handler).toHaveBeenCalledWith(req, "arg1", "arg2");
    expect(result).toEqual(mockResponse);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should catch errors, log them, and return a 500 Internal Server Error response for non-operational errors", async () => {
    const error = new Error("Unexpected crash");
    error.stack = "Mock stack trace";
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = apiHandler(handler);

    const result = await wrappedHandler(req);

    expect(handler).toHaveBeenCalledWith(req);
    expect(logger.error).toHaveBeenCalledWith("API Error:", {
      url: req.url,
      method: req.method,
      message: error.message,
      stack: error.stack,
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ body: { error: "Internal Server Error" }, status: 500 });
  });

  it("should catch errors, log them, and return a custom status code and message for operational errors", async () => {
    const error = new Error("Bad Request");
    error.statusCode = 400;
    error.isOperational = true;
    error.stack = "Mock stack trace";
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = apiHandler(handler);

    const result = await wrappedHandler(req);

    expect(logger.error).toHaveBeenCalledWith("API Error:", {
      url: req.url,
      method: req.method,
      message: error.message,
      stack: error.stack,
    });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Bad Request" }, { status: 400 });
    expect(result).toEqual({ body: { error: "Bad Request" }, status: 400 });
  });
});
