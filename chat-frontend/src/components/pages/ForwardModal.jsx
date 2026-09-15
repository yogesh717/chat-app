import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { fetchUsersApi } from "../Utils/api";
import constant from "../Utils/constant";

const ForwardModal = ({ show, onClose, onForward }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!show) return;
    setSelectedIds([]);
    fetchUsersApi(constant.fetchAllUrl).then((data) => {
      if (Array.isArray(data)) {
        setUsers(data.filter((u) => u._id !== currentUser?._id));
      }
    });
  }, [show, currentUser]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleForward = () => {
    if (selectedIds.length === 0) return;
    onForward(selectedIds);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Forward message</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
        {users.length === 0 && <p className="text-muted mb-0">No users to forward to.</p>}
        {users.map((u) => (
          <Form.Check
            key={u._id}
            type="checkbox"
            id={`forward-user-${u._id}`}
            label={u.fullName}
            checked={selectedIds.includes(u._id)}
            onChange={() => toggleUser(u._id)}
            className="mb-2"
          />
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={selectedIds.length === 0} onClick={handleForward}>
          Forward
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ForwardModal;
