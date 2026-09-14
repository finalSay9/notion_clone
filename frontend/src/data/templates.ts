export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  initialContent: string; // HTML seed content for the editor
}

export const templates: DocTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from nothing',
    initialContent: '',
  },
  {
    id: 'resume',
    name: 'Resume',
    description: 'Simple, clean resume layout',
    initialContent: `
      <h1 style="font-size:28px;margin:0 0 4px;">Your Name</h1>
      <p style="color:#4a4d4f;margin:0 0 20px;">email@example.com · City, Country · linkedin.com/in/you</p>
      <h2 style="font-size:16px;margin:20px 0 8px;">Experience</h2>
      <p style="margin:0 0 4px;"><strong>Job Title</strong> — Company Name</p>
      <p style="color:#4a4d4f;margin:0 0 12px;">Month Year – Present</p>
      <ul style="margin:0 0 16px;padding-left:20px;">
        <li>What you did and the impact it had</li>
        <li>Another accomplishment, ideally with a number</li>
      </ul>
      <h2 style="font-size:16px;margin:20px 0 8px;">Education</h2>
      <p style="margin:0;"><strong>Degree</strong> — Institution, Year</p>
    `,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Agenda, notes, and action items',
    initialContent: `
      <h1 style="font-size:24px;margin:0 0 4px;">Meeting Notes</h1>
      <p style="color:#4a4d4f;margin:0 0 20px;">Date · Attendees</p>
      <h2 style="font-size:16px;margin:16px 0 8px;">Agenda</h2>
      <ul style="margin:0 0 16px;padding-left:20px;"><li>Topic one</li><li>Topic two</li></ul>
      <h2 style="font-size:16px;margin:16px 0 8px;">Notes</h2>
      <p style="margin:0 0 16px;">&nbsp;</p>
      <h2 style="font-size:16px;margin:16px 0 8px;">Action items</h2>
      <ul style="margin:0;padding-left:20px;"><li>Who does what, by when</li></ul>
    `,
  },
  {
    id: 'letter',
    name: 'Letter',
    description: 'Formal letter format',
    initialContent: `
      <p style="margin:0 0 24px;">Your Name<br/>Your Address<br/>City, Date</p>
      <p style="margin:0 0 24px;">Recipient Name<br/>Recipient Address</p>
      <p style="margin:0 0 16px;">Dear [Recipient],</p>
      <p style="margin:0 0 16px;">&nbsp;</p>
      <p style="margin:0;">Sincerely,<br/>Your Name</p>
    `,
  },
];
