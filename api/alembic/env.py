import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context
from dotenv import load_dotenv

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))  # add project root to PYTHONPATH

from database import Base   # ✅ direct import

# Load environment variables from .env
load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ✅ Import your SQLAlchemy Base (adjust import path as needed)
# Example: if your Base is in backend/database.py
# from backend.database import Base  

# Provide MetaData for autogenerate
target_metadata = Base.metadata

# ✅ Override sqlalchemy.url in alembic.ini with env variable
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
