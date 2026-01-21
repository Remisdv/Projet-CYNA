---
description: Documentation des APIs CYNA
icon: terminal
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
---

# API Reference

Documentation de référence des APIs backend CYNA.

## Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| Gateway API | 3000 | Point d'entrée, agrégation des health checks |
| Back-Office API | 3001 | API pour le back-office |
| WebApp API | 3002 | API pour l'application web |
| Service API | 3003 | API de services |

## Swagger UI

La documentation interactive Swagger est disponible sur le Gateway :

```
http://localhost:3000/api
```

## Base URL

En développement local :

```
http://localhost:{port}
```
