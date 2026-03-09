import React, { useState } from "react";

import {
  Button,
  Card,
  Input,
  Modal,
  Table,
  Select,
  Alert
} from "./index.js";

export default function UITestPage() {

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const columns = ["Name", "Email", "Role"];

  const data = [
    ["Nguyen Van A", "a@gmail.com", "Student"],
    ["Tran Van B", "b@gmail.com", "Teacher"],
  ];

  const Section = ({ title, children }) => (
    <div style={{
      background:"#fff",
      borderRadius:16,
      padding:28,
      boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
      marginBottom:30
    }}>
      <h2 style={{
        fontSize:22,
        fontWeight:600,
        marginBottom:20
      }}>
        {title}
      </h2>

      <div style={{
        display:"flex",
        flexWrap:"wrap",
        gap:20
      }}>
        {children}
      </div>
    </div>
  );

  return (

    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#eef2ff,#f1f5ff,#f8fafc)",
      padding:"60px 40px",
      fontFamily:"Inter, sans-serif"
    }}>

      <div style={{maxWidth:1200, margin:"0 auto"}}>

        <h1 style={{fontSize:36, fontWeight:700, marginBottom:30}}>
          UI Component Playground 
        </h1>

        {/* GRID LAYOUT */}

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:30
        }}>

          {/* LEFT */}

          <div>

            <Section title="Buttons">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
            </Section>

            <Section title="Input">
              <div style={{width:300}}>
                <Input label="Username" placeholder="Enter username"/>
              </div>
            </Section>

            <Section title="Select">
              <Select
                options={[
                  {label:"Student",value:"student"},
                  {label:"Teacher",value:"teacher"}
                ]}
              />
            </Section>

            <Section title="Alerts">
              <div style={{width:"100%", display:"grid", gap:12}}>
                <Alert type="info" message="Info message"/>
                <Alert type="success" message="Success message"/>
                <Alert type="error" message="Error message"/>
              </div>
            </Section>

          </div>


          {/* RIGHT */}

          <div>

            <Section title="Card">
              <Card style={{padding:20}}>
                This is a card component example
              </Card>
            </Section>

            <Section title="Table">
              <Table columns={columns} data={data}/>
            </Section>

            <Section title="Modal">

              <Button onClick={()=>setOpen(true)}>
                Open Modal
              </Button>

              <Modal open={open}>
                <div style={{padding:24}}>
                  <h3 style={{marginBottom:10}}>Modal Test</h3>
                  <p style={{marginBottom:20}}>
                    This is a simple modal example
                  </p>

                  <Button onClick={()=>setOpen(false)}>
                    Close
                  </Button>
                </div>
              </Modal>

            </Section>

          </div>

        </div>


        {/* PAGINATION - CENTER BOTTOM */}

        <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: 15,
    marginTop: 40
  }}
>
  {[1, 2, 3, 4, 5].map((p) => (
    <div
      key={p}
      onClick={() => setPage(p)}
      style={{
        cursor: "pointer",
        fontSize: 18,
        fontWeight: 600,
        color: page === p ? "#2563eb" : "#6b7280",
        transition: "0.2s"
      }}
    >
      {p}
    </div>
  ))}
<<<<<<< HEAD
=======


>>>>>>> b7f72e8f30f2db09cddc1e161cd0cd61fde234cc
        </div>

      </div>

    </div>

  );
}