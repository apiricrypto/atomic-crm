import { render } from "vitest-browser-react";

import { buildContact, StoryWrapper } from "@/test/StoryWrapper";

import { DesktopTasksList } from "./DesktopTasksList";

describe("DesktopTasksList", () => {
  it("renders the desktop tasks route with its heading and task groups", async () => {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() - 1);

    const screen = await render(<DesktopTasksList />, {
      wrapper: ({ children }) => (
        <StoryWrapper
          data={{
            contacts: [buildContact()],
            tasks: [
              {
                contact_id: 1,
                done_date: null,
                due_date: dueDate.toISOString(),
                id: 1,
                sales_id: 0,
                text: "Follow up with customer",
                type: "Follow-up",
              },
            ],
          }}
        >
          {children}
        </StoryWrapper>
      ),
    });

    await expect
      .element(screen.getByRole("heading", { name: "Tasks" }))
      .toBeVisible();
    await expect
      .element(screen.getByText("Follow up with customer"))
      .toBeVisible();
  });
});
