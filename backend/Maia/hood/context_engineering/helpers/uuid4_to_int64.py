import hashlib, numpy as np

def uuid_to_uint64(u: str) -> np.uint64:
    h = hashlib.sha1(u.encode("utf-8")).digest()   # 20 bytes
    return np.frombuffer(h[:8], dtype=">u8")[0]

def uuid_to_uint64_salted(u: str, salt: int = 0) -> np.uint64:
    s = f"{u}:{salt}".encode("utf-8")
    h = hashlib.sha1(s).digest()
    return np.frombuffer(h[:8], dtype=">u8")[0]
# try salt = 0,1,2,... until free

def uuids_to_ids64(uuid_list):
    ids = []
    seen = set()
    for u in uuid_list:
        salt = 0
        while True:
            # base or salted 64-bit unsigned
            id64 = uuid_to_uint64(u) if salt == 0 else uuid_to_uint64_salted(u, salt)
            if id64 not in seen:
                seen.add(id64)
                ids.append(id64)
                break
            salt += 1  # rare path
    return np.array(ids, dtype=np.uint64)