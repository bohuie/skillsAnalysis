import React from "react";

const Alert = ({ visible, type, message, handleDismiss }) => {
    if (visible)
        return (
            <div
                className="wrapper"
                style={{
                    pointerEvents: "none",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    zIndex: "99"

                }}
            >
                <div
                    style={{
                        pointerEvents: "none",
                        padding: "20px 8%"
                    }}>
                    <div className={"alert alert-" + type + " alert-dismissible"} style={{
                        textAlign: "center", pointerEvents: "auto",
                    }}>
                        <button
                            type="button"
                            className="close"
                            onClick={handleDismiss}
                        >
                            &times;
                        </button>
                        {message}
                    </div>
                </div>

            </div>
        );
    else
        return (<div></div>);
};

export default Alert;