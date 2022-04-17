import { render, act, fireEvent, cleanup } from '@testing-library/react';
import Questions from '../pages/Questions';

describe("Questions component unit test", () => {
    let component = null;
    beforeEach(() => {
        component = render(<Questions />);
    })

    afterEach(() => {
        cleanup();
    })

    it("rendering and checking questions", () => {
        const { getByTestId } = component;
        expect(getByTestId("welcome-header").textContent).toBe("Welcome, please answer some questions.");
        expect(getByTestId("age").textContent).toBe("What is your age?");
        expect(getByTestId("gender").textContent).toBe("What is your gender?");
        expect(getByTestId("year").textContent).toBe("What is your year of study?");
        expect(getByTestId("submit-button")).toBeTruthy();
    });

})