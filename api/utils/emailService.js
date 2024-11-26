import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key:
    process.env.MAILGUN_API_KEY ||
    "129d4b77310070b2ab4142adbdaabecb-6df690bb-f94c8e1f",
});

export const testEmail = async () => {
  return mg.messages
    .create("sandbox826c540768f84400a65e1b30fb169ff4.mailgun.org", {
      from: "TestEmail",
      to: ["petar.markota@gmail.com"],
      subject: "Hello",
      text: "Testing some Mailgun awesomeness!",
      html: "<h1>Testing some Mailgun awesomeness!</h1>",
    })
    .then((msg) => console.log(msg))
    .catch((err) => console.log(err));
};

export const sendConfirmationEmail = async (userEmail, details) => {
  try {
    const response = await mg.messages.create(
      "sandbox826c540768f84400a65e1b30fb169ff4.mailgun.org",
      {
        from: "Mystery Box <mailgun@sandbox826c540768f84400a65e1b30fb169ff4.mailgun.org>",
        to: userEmail,
        subject: "Box Selection Confirmation",
        text: `
          Hello ${details.username}!
          Thank you for selecting mystery boxes!
          Selection Details:
          - Number of boxes selected: ${details.totalBoxesSelected}
          - Remaining credits: ${details.remainingCredits}
          Selected Boxes:
          ${details.selectedBoxes.map((box) => `- Box #${box.id}`).join("\n")}
          Thank you for using our service!
        `,
        html: `
          <h2>User: ${details.username} has submited a box selection</h2>
          <p>Thank you for selecting mystery boxes!</p>
          <h3>Selection Details:</h3>
          <ul>
            <li>Number of boxes selected: ${details.totalBoxesSelected}</li>
            <li>Remaining credits: ${details.remainingCredits}</li>
          </ul>
          <h3>Selected Boxes:</h3>
          <ul>
            ${details.selectedBoxes
              .map((box) => `<li>Box #${box.id}</li>`)
              .join("")}
          </ul>
          <p>Thank you for using our service!</p>
        `,
      }
    );
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
