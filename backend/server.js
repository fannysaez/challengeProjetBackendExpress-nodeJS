const express = require('express');
const { connectToMySQL, getConnection } = require('./db');
const { connectToRedis, getRedisClient } = require('./redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// **Route racine pour test**
app.get('/', (req, res) => {
  res.send('Serveur Express fonctionne !');
});

// Routes existantes
app.get('/posts', async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM posts');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const redisClient = getRedisClient();
  
  try {
    // Vérifier d'abord dans le cache Redis
    const cachedPost = await redisClient.get(`post:${postId}`);
    
    if (cachedPost) {
      console.log('Donnée récupérée depuis Redis');
      return res.json(JSON.parse(cachedPost));
    }
    
    // Si pas dans Redis, chercher dans MySQL
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    const post = rows[0];
    
    // Mettre en cache dans Redis pour les prochaines requêtes
    await redisClient.setEx(`post:${postId}`, 3600, JSON.stringify(post)); // Expire après 1 heure
    
    console.log('Donnée récupérée depuis MySQL et mise en cache');
    res.json(post);
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction pour réessayer la connexion avec un délai
async function waitForConnection(connectFunction, serviceName, maxRetries = 10, delay = 3000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await connectFunction();
      console.log(`Connecté à ${serviceName} avec succès`);
      return true;
    } catch (error) {
      retries++;
      console.log(`Tentative ${retries}/${maxRetries} pour se connecter à ${serviceName}...`);
      if (retries >= maxRetries) {
        console.error(`Impossible de se connecter à ${serviceName} après ${maxRetries} tentatives`);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Démarrer le serveur
async function startServer() {
  try {
    // Attendre que MySQL et Redis soient disponibles
    await waitForConnection(connectToMySQL, 'MySQL', 15, 3000);
    await waitForConnection(connectToRedis, 'Redis', 15, 3000);
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
