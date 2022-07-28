import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const MainForm = ({onSubmit, onChange, addon, submitLabel, placeholder}) => {

  return (
    <Form onSubmit={onSubmit}>
      <Row>
        <Col>
          <InputGroup>
            <Form.Control type="text" placeholder={placeholder} onChange={onChange} />
            {addon && <InputGroup.Text>Eth💎</InputGroup.Text>}
          </InputGroup>
        </Col>
        <Col md={2}><Button className="w-100" variant="dark" type="submit">{submitLabel}</Button></Col>
      </Row>
    </Form>
  );
}

// todo move buttton next to text box

export default MainForm;
