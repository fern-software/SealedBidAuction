import { Form, Button } from 'react-bootstrap';

const MainForm = ({onSubmit, onChange, label, submitLabel}) => {

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group md="4" className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control type="text" onChange={onChange} />
      </Form.Group>
      <Button variant="dark" type="submit">{submitLabel}</Button>
    </Form>
  );
}

export default MainForm;
