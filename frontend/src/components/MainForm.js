import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useState } from 'react';

const MainForm = ({onSubmit, onChange, addon, submitLabel, placeholder, loadingLabel}) => {
  let [isLoading, setIsLoading] = useState(false);

  return (
    <Form onSubmit={e => {setIsLoading(true); onSubmit(e);}}>
      <Row>
        <Col>
          <InputGroup>
            <Form.Control required type="text" placeholder={placeholder} onChange={onChange} />
            {addon && <InputGroup.Text>Eth💎</InputGroup.Text>}
          </InputGroup>
        </Col>
        <Col md={2}>
          <Button className="w-100" disabled={isLoading} variant="dark" type="submit">{isLoading ? loadingLabel : submitLabel}</Button>
        </Col>
      </Row>
    </Form>
  );
}

export default MainForm;
