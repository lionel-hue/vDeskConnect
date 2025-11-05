# vDeskConnect

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![EXPRESS](https://img.shields.io/badge/Backend-EXPRESS-informational?logo=express)
![License](https://img.shields.io/badge/License-MIT-green)
![Deploy](https://img.shields.io/badge/Deployed-Vercel-blue?logo=vercel)

> A virtual platform to primarily take classes as a student or teacher,
> Track student progress,
> Make decisions based on statistical data.

## 📝 Description

**vDeskConnect** is a web application initially inspired by a need to create a means to continue the school activities during an economical crisis. This need was detected in a West African Nigerian Based School @ Lagos and since then efforts are being made to extend the avaliability of this app to other schools in the region. 

This project has other educational goals like :
- showing how reactJS & expressJS work,
- revealing how statistical charts are integrated,
- MVC model works etc.

---

## 👥 Test Accounts

Use these account with their details below to test the application according to thier different roles :

| Role        | Email                    | Password   |
|-------------|--------------------------|----------------|
| 👑 Admin     | admin@admin.com         | 123456789       |
| 🎓 Teacher | teacher@teach.com| 123456789   |
| 🙋 Student | student@learn.com     | 123456789        |



## 🌐 Demo

Vercel Deployment : [https://vdeskconnect.vercel.app](link.link.com)

GitHub Repro : [http://lionel/vDeskConnect](https://github.com/lionel-hue/vDeskConnect)


# 🙌 Author

- [Lionel SISSO](https://github.com/lionel-hue)



--- 


## 🚀 Main Functionalities

### 👤 Student
- have classes
- view profile
- 

###  🎓 Teacher
- take classes
- create classes
- 

### 🛡️ Admin 
- View and Descide based on statsitical data
- invite users
- View app's activity
- Students and Teachers (CRUD)
- Promote other Teachers to Admin

---

## 📦 Prerequsite
- Node.js >= 20.19.5


## 🛠️ Technical Stack Stack 

### Frontend
- **React** (via vite)
- **React Router**
- **Dotenv**
- **React Hot Toast**
- **React Tooltip**
- **Lucide React**
- **React Icons**

### Styling
- **Vanilla CSS**

---

## ▶️ Launching Locally 

```bash
# Clone the repro
git clone <https://github.com/lionel-hue/vDeskConnect>
cd vDeskConnect/client

# Install all dependencies
npm install

# do the same in /server 
cd ./../server/
npm install

# create the environment variables
cp .env.example .env
cd ./../client
cp .env.example .env

# Launch the app's client
npm run dev

# Launch the app's server in a different terminal
cd ./../server
npm run dev

```

# Backend 

## 🏗️ Architecture

### Structure du Projet

```
backend/
├── auth/               # Authentification and autorisation
│
├── routes/             # API entry points
│   ├── auth/           # authentification entry point
│   └── home/           # other entry points
│
├── model/              # App model 
│
└── utils/              # Utilities et helpers
```

## 🚀 Technologies Used

- **Javascript** - Langage principal
- **Postgresql** - Base de données
- **Node Pg** - Accès sécurisé à la base de données
- **Node JWT** - Gestion des tokens d'authentification
- **Node Mailer** - Envoi d'emails
- **Node Bcrypt** - Password and senstivite credentails encryption

## 🔐 Security

### Mesures de Sécurité Implémentées

1. **Authentification JWT**

   - Tokens avec expiration (3 jours pour l'auth, 15 min pour confirmation)
   - Validation stricte des signatures

2. **Protection contre les Injections SQL**

   - Utilisation exclusive de PDO avec requêtes préparées
   - Validation et sanitisation des entrées

3. **Protection XSS**

   - `strip_tags()` sur toutes les entrées utilisateur
   - Validation des types de données

4. **Gestion Sécurisée des Fichiers**

   - Validation des types MIME
   - Renommage sécurisé des fichiers
   - Limitation de taille

5. **CORS Configuré**
   - Headers de sécurité appropriés
   - Gestion des credentials

## 📚 API Endpoints

### Authentification

- `POST /routes/users/user.create.php` - Créer un compte
- `POST /routes/users/user.login.php` - Connexion
- `POST /routes/users/user.logout.php` - Déconnexion
- `POST /routes/users/user.confirm-email.php` - Confirmer email
- `POST /routes/users/user.forgot-password.php` - Mot de passe oublié
- `POST /routes/users/user.reset-code.php` - Réinitialiser le mot de passe

### Utilisateurs

- `GET /routes/users/user.get.php` - Récupérer un utilisateur
- `PUT /routes/users/user.update.php` - Mettre à jour un profil
- `PUT /routes/users/user.change-pass.php` - Changer le mot de passe

### Articles

- `GET /routes/articles/article.get.php` - Récupérer les articles
- `POST /routes/articles/article.create.php` - Créer un article
- `PUT /routes/articles/article.update.php` - Modifier un article
- `DELETE /routes/articles/article.delete.php` - Supprimer un article
- `POST /routes/articles/article.like.php` - Liker un article

### Commentaires

- `POST /routes/comments/comments.create.php` - Créer un commentaire
- `DELETE /routes/comments/comments.delete.php` - Supprimer un commentaire

### Amitiés

- `POST /routes/friendship/friendship-send.php` - Envoyer une demande d'ami
- `POST /routes/friendship/friendship-confirm.php` - Accepter une demande
- `POST /routes/friendship/friendship-reject.php` - Refuser une demande
- `GET /routes/friendship/friendship-get-all.php` - Liste des amis
- `GET /routes/friendship/friendship-waiting-request.php` - Demandes en attente

### Messages

- `GET /routes/messages/message.get.php` - Récupérer les messages
- `POST /routes/messages/message.create.php` - Envoyer un message
- `PUT /routes/messages/message.update.php` - Modifier un message
- `DELETE /routes/messages/message.delete.php` - Supprimer un message

### Administration

- `GET /routes/admin/get.admin.php` - Statistiques admin
- `POST /routes/admin/admin.create.php` - Créer un admin
- `DELETE /routes/admin/admin.delete.php` - Supprimer un admin

### Modération

- `GET /routes/moderator/users.get.php` - Liste des utilisateurs
- `DELETE /routes/moderator/user-delete.php` - Supprimer un utilisateur
- `GET /routes/articles/Moderator/article.get.php` - Articles pour modération
- `DELETE /routes/articles/Moderator/article.delete.php` - Supprimer article (modo)


### Current Problems

1. **Account Creation with Bad Network**

   - Always ensure to switch to a good and stable network
   - Don't turn off Network Acess midway during account creation

2.. **JWT Error**
   - Verify the Jwt key
   - Verify the token expiration

-----