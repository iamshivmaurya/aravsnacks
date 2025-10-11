from sqlalchemy.orm import Session
from admin_model import Role
# from schema import RoleBaseCreate
from admin_schema import RoleCreate,RoleResponse





def get_role_by_id(db: Session, role_id: int):
    return db.query(Role).filter(Role.id == role_id).first()




def get_all_roles(db: Session):
    return db.query(Role).all()


#  ------------------------------create_role --------------

def create_role(db: Session, role_data: RoleCreate):
    new_role = Role(
        name=role_data.name,
        description=role_data.description
        # path=role_data.path,
        # method=role_data.method,
        # allowed=role_data.allowed
    )
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role


#  ------------------------------Update role --------------
def update_role(db: Session, role_id: int, role_data: RoleCreate):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        return None
    role.name = role_data.name
    description=role_data.description
    # role.path = role_data.path
    # role.method = role_data.method
    # role.allowed = role_data.allowed
    db.commit()
    db.refresh(role)
    return role

#__________________--------------  delete_role--------------------






def delete_role(db: Session, role_id: int):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        return None
    db.delete(role)
    db.commit()
    return role






