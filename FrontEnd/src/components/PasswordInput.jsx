import React, { Component } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

class PasswordInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPassword: false,
        };
        this.togglePassword = this.togglePassword.bind(this);
    }

    togglePassword() {
        this.setState((prev) => ({ showPassword: !prev.showPassword }));
    }

    render() {
        const { value, onChange, placeholder, id } = this.props;
        const { showPassword } = this.state;

        return (
            <div style={{ position: "relative", width: "100%" }}>
                <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="login-input"
                    style={{ paddingRight: "2.5rem" }}
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={this.togglePassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
            </div>
        );
    }
}

export default PasswordInput;
