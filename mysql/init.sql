CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (title, content) VALUES
('Premier post', 'Ceci est le contenu de mon premier post.'),
('Deuxième post', 'Contenu du deuxième post ici.'),
('Troisième post', 'Encore un autre post intéressant.');