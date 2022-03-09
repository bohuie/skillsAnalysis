import React from "react";

const Alert = ({ type, message, spinner, handleDismiss }) => {
    return (
        <div
            className="wrapper"
            style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                zIndex: "99"
            }}
        >
            <div className={"alert alert-" + type + " alert-dismissible"} style={{ textAlign: "center" }}>
                <button
                    type="button"
                    className="close"
                    onClick={handleDismiss}
                >
                    &times;
                </button>
                {message}{spinner ? (<span>&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>) : ('')}
            </div>
        </div>
    );
};

export default Alert;