import { createBasicAuthHandler } from "../src/index";
import { parse, unauthorized } from "../src/BasicAuth";

describe("parse", () => {
  test("returns undefined for undefined input", () => {
    const result = parse(undefined);
    expect(result).toBeUndefined();
  });

  test("returns undefined for null input", () => {
    const result = parse(null);
    expect(result).toBeUndefined();
  });

  test("returns undefined for non-Basic-Auth input", () => {
    const result = parse("Bearer abc.def.ghi");
    expect(result).toBeUndefined();
  });

  test("parses Basic-Auth input correctly", () => {
    const input = "Basic dXNlcm5hbWU6cGFzc3dvcmQ=";
    const expected = { name: "username", password: "password" };
    const result = parse(input);
    expect(result).toEqual(expected);
  });

  test("handles special characters in Basic-Auth input", () => {
    const input = "Basic dXNlcm5hbWU6cGFzc3d+eHl6LW1vZGU/";
    const expected = { name: "username", password: "passw~xyz-mode?" };
    const result = parse(input);
    expect(result).toEqual(expected);
  });
});

describe("unauthorized", () => {
  test("returns a Response object with the correct status code, body, and headers", async () => {
    const body = "Unauthorized";
    const response = unauthorized(body);
    expect(response.status).toBe(401);
    expect(response.statusText).toBe("'Authentication required.'");
    expect(response.headers.get("WWW-Authenticate")).toBe(
      'Basic realm="User Visible Realm"'
    );
    const responseBody = await response.text();
    expect(responseBody).toBe(body);
  });
});

describe("createBasicAuthHandler", () => {
  const authInfo = { name: "username", password: "password" };
  const unauthorizedText = "Authentication required.";
  const createTestRequest = (auth?: string): Request =>
    new Request("https://example.com/", {
      headers: auth ? { Authorization: `Basic ${btoa(auth)}` } : undefined,
    });
  const createMockContext = (
    request: Request,
    passThrough?: () => Promise<Response>
  ) => ({
    request,
    functionPath: "",
    waitUntil: () => undefined,
    passThroughOnException: passThrough || (() => undefined),
    next: async () => new Response("OK"),
    env: { ASSETS: { fetch } },
    params: {},
    data: {},
  });

  test("returns 401 Unauthorized when Authorization header is not present", async () => {
    const request = createTestRequest();
    const context = createMockContext(request);
    const handler = createBasicAuthHandler(authInfo, unauthorizedText);
    const response = await handler(context);
    expect(response.status).toBe(401);
    expect(response.statusText).toBe("'Authentication required.'");
    expect(response.headers.get("WWW-Authenticate")).toBe(
      'Basic realm="User Visible Realm"'
    );
  });

  test("returns 401 Unauthorized when Authorization header is invalid", async () => {
    const request = createTestRequest("invalid:header");
    const context = createMockContext(request);
    const handler = createBasicAuthHandler(authInfo, unauthorizedText);
    const response = await handler(context);
    expect(response.status).toBe(401);
    expect(response.statusText).toBe("'Authentication required.'");
    expect(response.headers.get("WWW-Authenticate")).toBe(
      'Basic realm="User Visible Realm"'
    );
  });

  test("returns the result of next() when Authorization header is valid", async () => {
    const request = createTestRequest("username:password");
    const context = createMockContext(request);
    const handler = createBasicAuthHandler(authInfo, unauthorizedText);
    const response = await handler(context);
    expect(await response.text()).toBe("OK");
  });
});
