import { render, act, fireEvent, cleanup, waitFor } from '@testing-library/react';
import Upload from '../pages/Upload';

describe("Upload component unit test", () => {
    let component = null;
    beforeEach(() => {
        component = render(<Upload />);
    })

    afterEach(() => {
        cleanup();
    });

    it("rendering upload components", () => {
        const { getByTestId } = component;
        expect(getByTestId("upload-header").textContent).toBe("Upload your resume in pdf format");
        expect(getByTestId("browse-header").textContent).toBe("Browse File ");
    });
})