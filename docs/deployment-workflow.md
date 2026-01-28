# Deployment Workflow

1. Merge PR to main branch
2. CI/CD pipeline runs and must pass
3. Build frontend: `npm run build`
4. Build backend: `uvicorn app.main:app --reload`
5. Run tests: `pytest`
6. Package artifacts
7. Deploy to production server (manual or automated)
8. Verify deployment
9. Monitor logs and metrics
