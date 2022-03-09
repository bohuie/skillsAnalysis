import { render, act, fireEvent, cleanup } from '@testing-library/react';
import Questions from '../components/Questions.js';

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
    });

    it("rendering header after answering questions", async () => {
        const { getByTestId } = component;
        await act(async () => {
            await fireEvent.change(getByTestId("age-input"), { target: { value: "19" } });
            await fireEvent.change(getByTestId("gender-input"), { target: { value: "male" } });
            await fireEvent.change(getByTestId("year-input"), { target: { value: "3" } });
        });
        expect(getByTestId("year").textContent).toBe("What is your year of study?");
    })

    it("rendering header after answering questions", async () => {
        const { getByTestId } = component;
        await act(async () => {
            await fireEvent.change(getByTestId("age-input"), { target: { value: "nineteen" } });
            await fireEvent.change(getByTestId("gender-input"), { target: { value: "not male" } });
            await fireEvent.change(getByTestId("year-input"), { target: { value: "three" } });
        });
        expect(getByTestId("year").textContent).toBe("What is your year of study?");
    })
})