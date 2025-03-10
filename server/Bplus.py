class BPlusTreeNode:
    def __init__(self, is_leaf=False):
        self.is_leaf = is_leaf
        self.keys = []  # Keys (e.g., faculty id or name)
        self.values = [] if is_leaf else []  # Values only in leaf nodes (faculty profiles)
        self.children = [] if not is_leaf else None  # Pointers to children (non-leaf only)
        self.next = None  # Next leaf pointer for sequential access

class BPlusTree:
    def __init__(self, order):
        self.order = order  # Max pointers per node
        self.root = BPlusTreeNode(is_leaf=True)  # Start with a leaf root

    def _split_node(self, node, parent=None):
        mid = len(node.keys) // 2
        new_node = BPlusTreeNode(is_leaf=node.is_leaf)

        # Split keys and values/children
        new_node.keys = node.keys[mid:]
        if node.is_leaf:
            new_node.values = node.values[mid:]
        else:
            new_node.children = node.children[mid + 1:]
        node.keys = node.keys[:mid]
        if node.is_leaf:
            node.values = node.values[:mid]
        else:
            node.children = node.children[:mid + 1]

        # Link leaf nodes
        if node.is_leaf:
            new_node.next = node.next
            node.next = new_node

        # If no parent, create new root
        if parent is None:
            new_root = BPlusTreeNode(is_leaf=False)
            new_root.keys = [new_node.keys[0]]
            new_root.children = [node, new_node]
            self.root = new_root
            return

        # Insert into parent
        insert_pos = 0
        while insert_pos < len(parent.keys) and parent.keys[insert_pos] < new_node.keys[0]:
            insert_pos += 1
        parent.keys.insert(insert_pos, new_node.keys[0])
        parent.children.insert(insert_pos + 1, new_node)

        # Split parent if full
        if len(parent.keys) >= self.order:
            self._split_node(parent, self._find_parent(parent))

    def _find_parent(self, node):
        def _search(node, target):
            if node.is_leaf or node == target:
                return None
            for i in range(len(node.keys)):
                if target in node.children[:i + 1]:
                    return node
                if i == len(node.keys) - 1 or node.keys[i] > target.keys[0]:
                    return _search(node.children[i + 1], target)
            return None
        return _search(self.root, node)

    def insert(self, key, value):
        node = self.root
        # Traverse to leaf
        while not node.is_leaf:
            i = 0
            while i < len(node.keys) and key >= node.keys[i]:
                i += 1
            node = node.children[i]

        # Insert into leaf
        insert_pos = 0
        while insert_pos < len(node.keys) and key > node.keys[insert_pos]:
            insert_pos += 1
        node.keys.insert(insert_pos, key)
        node.values.insert(insert_pos, value)

        # Split if full
        if len(node.keys) >= self.order:
            self._split_node(node, self._find_parent(node))

    def search(self, key):
        node = self.root
        while not node.is_leaf:
            i = 0
            while i < len(node.keys) and key >= node.keys[i]:
                i += 1
            node = node.children[i]
        for i, k in enumerate(node.keys):
            if k == key:
                return node.values[i]
        return None

    def get_all_profiles(self):
        profiles = []
        node = self.root
        # Go to leftmost leaf
        while not node.is_leaf:
            node = node.children[0]
        # Traverse linked leaves
        while node:
            for i in range(len(node.keys)):
                profiles.append((node.keys[i], node.values[i]))
            node = node.next
        return profiles

# Example Faculty Profile Structure
def create_faculty_profile(id, name, bio, qualifications="", experience="", **kwargs):
    return {
        "id": id,
        "name": name,
        "bio": bio,
        "qualifications": qualifications,
        "experience": experience,
        **kwargs  # Additional fields like tenth_cert, phd_degree, etc.
    }

# Usage Example
if __name__ == "__main__":
    # Initialize B+ Tree with order 4 (max 4 pointers per node)
    bpt = BPlusTree(order=4)

    # Seed initial data (matching server.js)
    bpt.insert(2, create_faculty_profile(
        id=2,
        name="Dr. Mike Lee",
        bio="Information Technology Specialist",
        qualifications="PhD",
        experience="10 years teaching"
    ))
    bpt.insert(1, create_faculty_profile(
        id=1,
        name="Admin User",
        bio="System Administrator",
        qualifications="MTech",
        experience="15 years admin"
    ))

    # Search by ID
    profile = bpt.search(2)
    print("Search ID 2:", profile)

    # Get all profiles
    all_profiles = bpt.get_all_profiles()
    print("All Profiles:", all_profiles)