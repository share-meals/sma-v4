//import {FirebaseWrapper} from "@/components/FirebaseWrapper";
import {FirebaseWrapper} from "./FirebaseWrapper";
import {render} from "@testing-library/react";

describe("FirebaseWrapper Component", () => {
  it("should render with children", () => {
    const {getByTestId} = render(
      <FirebaseWrapper>
        <div data-testid="child"></div>
      </FirebaseWrapper>,
    );
    expect(getByTestId("child")).toBeDefined();
  });
});
