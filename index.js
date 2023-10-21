const express = require('express');
const pgp = require('pg-promise')();
const app = express();
const port = process.env.PORT || 3030;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 

// Swagger
app.use('/api-generation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Swagger no Redocly
app.get('/swagger', (request, response) =>  {
    return response.sendFile(process.cwd() + '/swagger.json')
})
app.get('/docs', (request, response) =>  {
  return response.sendFile(process.cwd() + '/index.html')
})

// Configuração do banco de dados PostgreSQL
const db = pgp({
  connectionString: 'postgres://postgres:admin@localhost/escola',
});

app.use(express.json()); // Usando o middleware incorporado do Express para análise do corpo da solicitação

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port} 🔥`);
});

// Rota para listar todos os alunos
app.get('/alunos', async (req, res) => {
  try {
    const alunos = await db.any('SELECT * FROM alunos');
    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});
// Rota para buscar um aluno por ID
app.get('/alunos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const aluno = await db.oneOrNone('SELECT * FROM alunos WHERE id = $1', id);

    if (aluno) {
      res.json(aluno);
    } else {
      res.status(404).json({ error: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar aluno por ID' });
  }
});


// Rota para criar um novo aluno
app.post('/alunos', async (req, res) => {
  try {
    const { nome, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala } = req.body;
    const newAluno = await db.one(
      'INSERT INTO alunos (nome, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala]
    );
    res.status(201).json(newAluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar um novo aluno' });
  }
});

// Rota para atualizar um aluno por ID
app.put('/alunos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala } = req.body;
    const updatedAluno = await db.oneOrNone(
      'UPDATE alunos SET nome = $2, idade = $3, nota_primeiro_semestre = $4, nota_segundo_semestre = $5, nome_professor = $6, numero_sala = $7 WHERE id = $1 RETURNING *',
      [id, nome, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala]
    );

    if (updatedAluno) {
      res.json(updatedAluno);
    } else {
      res.status(404).json({ error: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o aluno' });
  }
});

// Rota para excluir um aluno por ID
app.delete('/alunos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedAluno = await db.result('DELETE FROM alunos WHERE id = $1', id, (r) => r.rowCount);
    if (deletedAluno === 1) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Aluno não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir o aluno' });
  }
});