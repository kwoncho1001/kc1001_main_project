import { AbilityLevel, HierarchyRequest, HierarchyResponse, PropagationWeights } from '../types/ability';

export interface HierarchyNode {
  id: string;
  name: string;
  level: AbilityLevel;
  parentId?: string;
  description?: string;
}

export interface HierarchyTree extends HierarchyNode {
  children: HierarchyTree[];
}

export class HierarchyService {
  private static nodes: HierarchyNode[] = [
    { id: 'f1', name: 'Mathematics', level: 'FIELD' },
    { id: 's1', name: 'Calculus', level: 'COURSE', parentId: 'f1' },
    { id: 's2', name: 'Algebra', level: 'COURSE', parentId: 'f1' },
    { id: 'm1', name: 'Differentiation', level: 'MAJOR_CHAPTER', parentId: 's1' },
    { id: 'n1', name: 'Chain Rule', level: 'MINOR_CHAPTER', parentId: 'm1' },
    { id: 't1', name: 'Implicit Differentiation', level: 'TYPE', parentId: 'n1' },
    { id: 't2', name: 'Power Rule', level: 'TYPE', parentId: 'n1' },
    { id: 'm2', name: 'Integration', level: 'MAJOR_CHAPTER', parentId: 's1' },
    { id: 'n2', name: 'Substitution Rule', level: 'MINOR_CHAPTER', parentId: 'm2' },
    { id: 't3', name: 'U-Substitution', level: 'TYPE', parentId: 'n2' },
  ];

  private static weights: PropagationWeights = {
    FIELD_TO_COURSE: 0.9,
    COURSE_TO_MAJOR_CHAPTER: 0.85,
    MAJOR_CHAPTER_TO_MINOR_CHAPTER: 0.8,
    MINOR_CHAPTER_TO_TYPE: 0.75,
  };

  static dispatch(request: HierarchyRequest): HierarchyResponse {
    const { action, level, id, parent_id, name, description, propagation_weights } = request;

    switch (action) {
      case 'CREATE':
        if (!level || !id || !name) return this.fail('Missing required fields for CREATE');
        if (this.nodes.some(n => n.id === id)) return this.fail(`ID ${id} already exists`);
        
        // Validate parent
        if (level !== 'FIELD') {
          if (!parent_id) return this.fail('parent_id is required for non-FIELD levels');
          const parent = this.nodes.find(n => n.id === parent_id);
          if (!parent) return this.fail(`Parent ID ${parent_id} not found`);
          if (!this.isValidParent(level, parent.level)) return this.fail(`Invalid parent level ${parent.level} for ${level}`);
        }

        const newNode: HierarchyNode = { id, name, level, parentId: parent_id, description };
        this.nodes.push(newNode);
        return this.success('Node created successfully', { item: newNode });

      case 'READ':
        if (!id) return this.fail('ID is required for READ');
        const node = this.nodes.find(n => n.id === id);
        return node ? this.success('Node found', { item: node }) : this.fail(`Node ${id} not found`);

      case 'UPDATE':
        if (!id) return this.fail('ID is required for UPDATE');
        const index = this.nodes.findIndex(n => n.id === id);
        if (index === -1) return this.fail(`Node ${id} not found`);

        if (name) this.nodes[index].name = name;
        if (description !== undefined) this.nodes[index].description = description;
        if (parent_id) {
          const parent = this.nodes.find(n => n.id === parent_id);
          if (!parent) return this.fail(`Parent ID ${parent_id} not found`);
          if (!this.isValidParent(this.nodes[index].level, parent.level)) return this.fail('Invalid parent level');
          this.nodes[index].parentId = parent_id;
        }

        if (propagation_weights) {
          this.weights = { ...this.weights, ...propagation_weights };
        }

        return this.success('Node updated successfully', { item: this.nodes[index] });

      case 'DELETE':
        if (!id) return this.fail('ID is required for DELETE');
        const deleteIndex = this.nodes.findIndex(n => n.id === id);
        if (deleteIndex === -1) return this.fail(`Node ${id} not found`);

        // Check for children
        if (this.nodes.some(n => n.parentId === id)) {
          return this.fail('Cannot delete node with children. Delete children first.');
        }

        // Mock check for linked data (problems/skills)
        // In a real app, we'd query the DB here.
        
        const deletedNode = this.nodes.splice(deleteIndex, 1)[0];
        return this.success('Node deleted successfully', { item: deletedNode });

      case 'GET_ALL_STRUCTURE':
        return this.success('Structure retrieved', { structure: this.getStructure() });

      case 'GET_PROPAGATION_WEIGHTS':
        return this.success('Weights retrieved', { propagation_weights: this.weights });

      default:
        return this.fail(`Unknown action: ${action}`);
    }
  }

  private static isValidParent(childLevel: AbilityLevel, parentLevel: AbilityLevel): boolean {
    const levels: AbilityLevel[] = ['FIELD', 'COURSE', 'MAJOR_CHAPTER', 'MINOR_CHAPTER', 'TYPE'];
    const childIdx = levels.indexOf(childLevel);
    const parentIdx = levels.indexOf(parentLevel);
    return childIdx === parentIdx + 1;
  }

  private static success(message: string, data?: any): HierarchyResponse {
    return { status: 'SUCCESS', message, data };
  }

  private static fail(message: string): HierarchyResponse {
    return { status: 'FAILURE', message };
  }

  static getAllNodes(): HierarchyNode[] {
    return [...this.nodes];
  }

  static getStructure(): HierarchyTree[] {
    const nodeMap: Record<string, HierarchyTree> = {};
    const roots: HierarchyTree[] = [];

    this.nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] };
    });

    this.nodes.forEach(node => {
      if (node.parentId && nodeMap[node.parentId]) {
        nodeMap[node.parentId].children.push(nodeMap[node.id]);
      } else {
        roots.push(nodeMap[node.id]);
      }
    });

    return roots;
  }

  static getPropagationWeights(): PropagationWeights {
    return { ...this.weights };
  }
}
