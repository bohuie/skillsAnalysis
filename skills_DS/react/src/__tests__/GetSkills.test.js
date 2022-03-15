import { render, act, fireEvent, cleanup } from '@testing-library/react';
import GetSkills from '../pages/admin/GetSkills'

describe("Profile component unit test", () => {
    let component = null;
    beforeEach(() => {
        component = render(<GetSkills />);
    })

    afterEach(() => {
        cleanup();
    });

    it("rendering upload components", () => {
        const { getByTestId } = component;
        expect(getByTestId("scrape-header").textContent).toBe("Scrape Jobs");
        expect(getByTestId("position-label").textContent).toBe("Position:");
        expect(getByTestId("location-label").textContent).toBe("Location:");
        expect(getByTestId("remote-label").textContent).toBe("Remote:");
        expect(getByTestId("jobs-label").textContent).toBe("Number of jobs to fetch:");
        expect(getByTestId("radius-label").textContent).toBe("Radius (km):");
        expect(getByTestId("extract-header").textContent).toBe("Extract Skills");
        expect(getByTestId("position-extract-label").textContent).toBe("Position:");
        expect(getByTestId("location-extract-label").textContent).toBe("Location:");
        expect(getByTestId("distance-extract-label").textContent).toBe("Max distance away (km):");
        expect(getByTestId("jobs-button")).toBeTruthy();
        expect(getByTestId("skills-button")).toBeTruthy();
    });
})