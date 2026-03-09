import React, { useState } from "react";

import { 
  Button,
  Card,
  Input,
  Modal,
  Table,
  Select,
  Alert,
  Pagination
} from "./index.js";

export default function UITestPage() {

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const columns = ["Name", "Email", "Role"];
  const data = [
    ["Nguyen Van A", "a@gmail.com", "Student"],
    ["Tran Van B", "b@gmail.com", "Teacher"],
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>UI Component Test</h1>

      <h2>Button</h2>
      <Button>Primary Button</Button>
      <Button variant="secondary">Secondary</Button>

      <h2>Input</h2>
      <Input label="Username" placeholder="Enter username" />

      <h2>Select</h2>
      <Select
        options={[
          { label: "Student", value: "student" },
          { label: "Teacher", value: "teacher" },
        ]}
      />

      <h2>Alert</h2>
      <Alert type="info" message="Info message" />
      <Alert type="success" message="Success message" />
      <Alert type="error" message="Error message" />

      <h2>Card</h2>
      <Card>
        <p>This is a card</p>
      </Card>

      <h2>Table</h2>
      <Table columns={columns} data={data} />

      <h2>Pagination</h2>
      <Pagination page={page} total={5} onChange={setPage} />

      <h2>Modal</h2>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal open={open}>
        <h3>Modal Test</h3>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </Modal>
    </div>
  );
}