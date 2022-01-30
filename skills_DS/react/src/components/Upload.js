import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [selectedFileName, setSelectedFileName] = useState("");
    const [isFilePicked, setIsFilePicked] = useState(false);

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setSelectedFileName(event.target.files[0].name);
        setIsFilePicked(true);
    };

    const handleSubmission = () => {

        try {

            if (!isFilePicked) return alert('File is not picked!')
            if (selectedFile.type !== 'application/pdf') return alert('File is not pdf!');

            const form_data = new FormData();

            form_data.append('file', selectedFile);

            axios.post("/api/fileupload", form_data, { headers: { "X-CSRFTOKEN": Cookies.get('csrftoken'), "Content-Disposition": `attachment; filename=${selectedFile.name}`, "Content-Type": "multipart/form-data" } })
                .then(res => {
                    console.log(res.data);
                })
                .catch(() => alert("You have to log in first!"))

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <h2>Upload resume in pdf format</h2>
            <div className="col-lg-6 col-sm-6 col-12">

                <div className="input-group">
                    <label className="input-group-btn">
                        <span className="btn btn-primary">
                            Browse File <input type="file" name="file" onChange={changeHandler} accept="application/pdf" style={{display: "none"}} multiple />
                        </span>
                    </label>
                    {selectedFile ? (
                        <input type="text" className="form-control" placeholder={selectedFileName} readOnly />
                    ) : (
                        <input type="text" className="form-control" placeholder="No file selected" readOnly />
                    )}
                </div>

            </div>
            {selectedFileName ? (
                <div>
                    <button className="btn btn-primary" onClick={handleSubmission}>Submit</button>
                </div>
            ) : (
                <p>Select a pdf file to continue</p>
            )}
        </div>
    )
}

export default Upload;
