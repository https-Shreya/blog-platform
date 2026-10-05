import { useState } from "react";
import "./Auth.css";

const API_URL = "https://blog-platform-l89y.onrender.com/api/auth";

function Auth({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!email || !password || (!isLogin && !name)) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isLogin
        ? `${API_URL}/login`
        : `${API_URL}/register`;

      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      if (isLogin) {
        localStorage.setItem("bloglyToken", data.token);
        localStorage.setItem(
          "bloglyUser",
          JSON.stringify(data.user)
        );

        setMessage("Login successful! 💜");

        setTimeout(() => {
          onLogin(data.user);
        }, 700);
      } else {
        setMessage(
          "Account created successfully! You can now log in. 💜"
        );

        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          setIsLogin(true);
          setMessage("");
        }, 1000);
      }
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">

        <button
          className="auth-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="auth-header">
          <p className="auth-small-heading">
            WELCOME TO BLOGLY
          </p>

          <h1>
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>

          <span>
            {isLogin
              ? "Log in to continue your blogging journey."
              : "Join Blogly and start sharing your ideas."}
          </span>
        </div>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="auth-field">
              <label>Your Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <div className="auth-switch">
          {isLogin ? (
            <>
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Auth;