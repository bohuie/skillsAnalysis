import { render, act, fireEvent, cleanup } from '@testing-library/react';
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
    
    it("input pdf file", async () => {
        const { getByTestId } = component;
        await act(async () => {
            const file = new File(['blob'], '2022_Quan_Resume.pdf', { type: 'application/pdf' });
            await fireEvent.change(getByTestId('file-input'), {
                target: { files: [file] },
            });
        })
        expect(getByTestId("file-name").textContent).toBe("2022_Quan_Resume.pdf");
    })

    it("input txt file", async () => {
        const { getByTestId } = component;
        await act(async () => {
            const file = new File(['blob'], '2022_Quan_Resume.txt', { type: 'application/txt' });
            await fireEvent.change(getByTestId('file-input'), {
                target: { files: [file] },
            });
        })
        expect(getByTestId("file-name").textContent).toBe("2022_Quan_Resume.txt");  // should still be usable as we are limiting when choosing file
    })
})