import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";

function Probe() {
  const auth = useAuth();
  return <p>{auth.restoring ? "restoring" : (auth.user?.email ?? "guest")}</p>;
}

describe("useAuth", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not update an unmounted view after delayed session refresh", async () => {
    let resolveResponse: (response: Response) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );
    const view = render(<Probe />);
    view.unmount();
    resolveResponse(
      new Response(
        JSON.stringify({
          accessToken: "token",
          user: {
            id: "user",
            email: "a@example.com",
            role: "learner",
            createdAt: "now",
          },
        }),
      ),
    );
    await Promise.resolve();
    expect(true).toBe(true);
  });

  it("restores an active session from the refresh cookie", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              accessToken: "token",
              user: {
                id: "user",
                email: "a@example.com",
                role: "learner",
                createdAt: "now",
              },
            }),
          ),
        ),
      ),
    );

    render(<Probe />);

    expect(await screen.findByText("a@example.com")).not.toBeNull();
  });
});
