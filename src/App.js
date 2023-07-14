import { set, ref, onValue, remove, update } from 'firebase/database';
import './App.css';
import { db } from './firebase';
import { uid } from 'uid';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';

function App() {
  const [todo, setTodo] = useState('');
  const [description, setDescription] = useState('');
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUuid, setTempUuid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTodo, setModalTodo] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);

  const handleTodoChange = (e) => {
    setTodo(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // read
  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setTodos([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((todo) => {
          setTodos((oldArray) => [...oldArray, todo]);
        });
      }
    });
  }, []);

  // write
  const writeToDatabase = () => {
    if (!modalTodo || !modalDescription) {
      alert('Complete os dados');
      return;
    }

    const titleExists = todos.some((todo) => todo.todo === modalTodo);

    if (titleExists) {
      alert('O título já existe. Por favor, escolha um título diferente.');
    } else {
      const uuid = uid();
      set(ref(db, `/${uuid}`), {
        todo: modalTodo,
        description: modalDescription,
        uuid,
      });
      setModalTodo('');
      setModalDescription('');
      setShowModal(false);
    }
  };

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTempUuid(todo.uuid);
    setModalTodo(todo.todo);
    setModalDescription(todo.description);
    setShowModal(true);
  };

  const handleSubmitChange = () => {
    if (!modalTodo || !modalDescription) {
      alert('Complete os dados');
      return;
    }

    const titleExists = todos.some((todo) => todo.todo === modalTodo && todo.uuid !== tempUuid);

    if (titleExists) {
      alert('O título já existe. Por favor, escolha um título diferente.');
      return;
    }

    update(ref(db, `/${tempUuid}`), {
      todo: modalTodo,
      description: modalDescription,
      uuid: tempUuid,
    });

    setModalTodo('');
    setModalDescription('');
    setIsEdit(false);
    setShowModal(false);
  };

  // delete
  const handleDelete = (todo) => {
    setTempUuid(todo.uuid);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmation = () => {
    remove(ref(db, `/${tempUuid}`));
    setShowDeleteModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTodo('');
    setModalDescription('');
    setIsEdit(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleFieldClick = (data) => {
    setSelectedData(data);
    setShowDataModal(true);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
  };

  return (
    <div className="App">
      <div className="button-container d-flex justify-content-end">
        <Button variant="success" className="custom-button" onClick={handleOpenModal}>
          Adicionar Usuário
        </Button>
      </div>

      <div className="table-responsive">
        <Table className="App-table">
          <thead>
            <tr>
              <th></th>
              <th>Título</th>
              <th>Autor</th>
              <th>Editar</th>
              <th>Apagar</th>
              <th>Ver Dados</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.uuid}>
                <td className='agua'></td>
                <td>{todo.todo}</td>
                <td>{todo.description}</td>
                <td>
                  <Button variant="primary" className="custom-button1" onClick={() => handleUpdate(todo)}>
                    <FaEdit />
                  </Button>
                </td>
                <td>
                  <Button variant="danger" className="custom-button2" onClick={() => handleDelete(todo)}>
                    <FaTrash />
                  </Button>
                </td>
                <td>
                  <Button variant="info" onClick={() => handleFieldClick(todo)}>
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTodo">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" value={modalTodo} onChange={(e) => setModalTodo(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Autor</Form.Label>
              <Form.Control
                type="text"
                rows={3}
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEdit ? (
            <>
              <Button variant="primary" onClick={handleSubmitChange}>
                Submit Change
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" className="custom-button" onClick={writeToDatabase}>
                Adicionar usuário
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja realmente excluir os dados?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmation}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDataModal} onHide={handleCloseDataModal}>
        <Modal.Header closeButton>
          <Modal.Title>Dados do Campo Selecionado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedData && (
            <>
              <p>Título: {selectedData.todo}</p>
              <p>Autor: {selectedData.description}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDataModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
