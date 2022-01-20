import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Upload = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
    };

    const handleSubmission = () => {

        try{

            if(!isFilePicked) return alert('File is not picked!')
            if(selectedFile.type !== 'application/pdf') return alert('File is not pdf!');
    
            const file = new FormData();
            
            console.log(selectedFile);

            // formData.append('filename', selectedFile.name);
            file.append('file', selectedFile);
            
            axios.post("/api/fileupload", {file}, {headers: {"X-CSRFTOKEN": Cookies.get('csrftoken'), "Content-Disposition": `attachment; filename=${selectedFile.name}`}})
            .then(res => {
                console.log(res.data);
            })

        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div>
            <input type="file" name="file" onChange={changeHandler} />
            {selectedFile ? (
                <div>
                    <button onClick={handleSubmission}>Submit</button>
                </div>
            ) : (
                <p>Select a file to show details</p>
            )}
        </div>
    )
}

export default Upload;