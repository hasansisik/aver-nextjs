"use client";

import { useState } from "react";
import Markdown from "react-markdown";

const ContactForm = ({ data }) => {
  const { email, mailSubject, successMessage, errorMessage } = data;

  // Handler Form Submit
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const formsubmitURL = `https://formsubmit.co/ajax/${email}`;

  const formHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(formsubmitURL, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        _subject: mailSubject,
        name: full_name.value,
        email: email.value,
        message: message.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setSubmitted("success");
        e.target.reset();
      })
      .catch((error) => {
        setLoading(false);
        setSubmitted("error");
      });
  };

  return (
    <form
      className="pr-0 lg:pr-8"
      method="POST"
      onSubmit={formHandler}
    >
      <input
        className="hidden"
        type="hidden"
        name="_subject"
        value={mailSubject}
      />
      <div className="mb-6">
        <label htmlFor="full_name" className="block mb-2 text-black">Name</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          placeholder="Charlie Edward"
          className="border border-light/90 rounded-lg bg-white h-12 w-full px-4 py-4 focus:border-dark/50 outline-none focus-visible:outline-none focus-visible:shadow-none transition-all duration-300"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="email" className="block mb-2 text-black">Contact email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="charlie.edward@email.app"
          className="border border-light/90 rounded-lg bg-white h-12 w-full px-4 py-4 focus:border-dark/50 outline-none focus-visible:outline-none focus-visible:shadow-none transition-all duration-300"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="message" className="block mb-2 text-black">Additional info</label>
        <textarea
          id="message"
          name="message"
          rows="4"
          className="border border-light/90 rounded-lg bg-white w-full px-4 py-4 focus:border-dark/50 outline-none focus-visible:outline-none focus-visible:shadow-none transition-all duration-300"
          placeholder="Be as detailed as possible..."
        ></textarea>
      </div>

      {submitted === "success" && (
        <div className="mb-6 text-green-600">
          <Markdown
            inline="false"
            content={successMessage}
          />
        </div>
      )}
      {submitted === "error" && (
        <div className="mb-6 text-red-600">
          <Markdown
            inline="false"
            content={errorMessage}
          />
        </div>
      )}

      <button
        className="button button-dark mt-2"
        title="Send your Message"
        type="submit"
        aria-label="Send Message"
      >
        <span>{!loading ? "Send Message" : "Sending.."}</span>
      </button>
    </form>
  )
}

export default ContactForm;