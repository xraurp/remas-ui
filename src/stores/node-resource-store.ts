import { defineStore, acceptHMRUpdate } from 'pinia';
import type { Node, Resource, ResourceAlias } from 'src/components/db_models';
import { apiRequest } from 'src/components/aux_functions';

const nodeBasePath = '/node';
const resourceBasePath = '/resource';
const resourceAliasBasePath = '/resource_alias';

export const useNodeResourceStore = defineStore('nodeResourceStore', {
  state: () => ({
    nodes: <Node[]>[],
    resources: <Resource[]>[],
    resource_aliases: <ResourceAlias[]>[],
  }),
  getters: {
    getNodes: (state) => state.nodes,
    getResources: (state) => state.resources,
  },
  actions: {
    async fetchNodes(): Promise<void> {
      this.nodes = await apiRequest<Node[], Node[]>(
        nodeBasePath,
        'Failed to fetch nodes!',
        'get',
      );
    },
    async createNode(node: Node): Promise<Node> {
      const data = await apiRequest<Node, Node>(
        nodeBasePath,
        'Failed to create node!',
        'post',
        node,
      );
      this.nodes.push(data);
      return data;
    },
    async updateNode(node: Node): Promise<Node> {
      const data = await apiRequest<Node, Node>(
        nodeBasePath,
        'Failed to update node!',
        'put',
        node,
      );
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i]?.id === node.id) {
          this.nodes[i] = data;
          break;
        }
      }
      return data;
    },
    async deleteNode(node: Node): Promise<void> {
      await apiRequest<Node, object>(
        nodeBasePath,
        'Failed to delete node!',
        'delete',
        node,
      );
      this.nodes = this.nodes.filter((n) => n.id !== node.id);
    },
    async addResourceToNode(
      node: Node,
      resource: Resource,
      amount: number,
    ): Promise<Node> {
      const data = await apiRequest<object, Node>(
        `${nodeBasePath}/add_resource`,
        'Failed to add resource to node!',
        'post',
        {
          resource_id: resource.id,
          node_id: node.id,
          amount,
        },
      );
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i]?.id === node.id) {
          this.nodes[i] = data;
          break;
        }
      }
      return data;
    },
    async removeResourceFromNode(
      node: Node,
      resource: Resource,
    ): Promise<Node> {
      const data = await apiRequest<object, Node>(
        `${nodeBasePath}/remove_resource`,
        'Failed to remove resource from node!',
        'post',
        {
          resource_id: resource.id,
          node_id: node.id,
          amount: 0,
        },
      );
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i]?.id === node.id) {
          this.nodes[i] = data;
          break;
        }
      }
      return data;
    },
    async fetchResources(): Promise<void> {
      this.resources = await apiRequest<Resource[], Resource[]>(
        resourceBasePath,
        'Failed to fetch resources!',
        'get',
      );
    },
    async createResource(resource: Resource): Promise<Resource> {
      const data = await apiRequest<Resource, Resource>(
        resourceBasePath,
        'Failed to create resource!',
        'post',
        resource,
      );
      this.resources.push(data);
      return data;
    },

    async updateResource(resource: Resource): Promise<Resource> {
      const data = await apiRequest<Resource, Resource>(
        resourceBasePath,
        'Failed to update resource!',
        'put',
        resource,
      );
      for (let i = 0; i < this.resources.length; i++) {
        if (this.resources[i]?.id === resource.id) {
          this.resources[i] = data;
          break;
        }
      }
      return data;
    },

    async deleteResource(resource: Resource): Promise<void> {
      await apiRequest<Resource, object>(
        resourceBasePath,
        'Failed to delete resource!',
        'delete',
        resource,
      );
      this.resources = this.resources.filter((r) => r.id !== resource.id);
    },
    async addResourceAliasToResource(
      resource: Resource,
      resource_alias: ResourceAlias,
    ): Promise<Resource> {
      const data = await apiRequest<object, Resource>(
        `${resourceBasePath}/add_alias`,
        'Failed to add resource alias to resource!',
        'post',
        {
          resource_id: resource.id,
          resource_alias_id: resource_alias.id,
        },
      );
      for (let i = 0; i < this.resources.length; i++) {
        if (this.resources[i]?.id === resource.id) {
          this.resources[i] = data;
          break;
        }
      }
      return data;
    },
    async fetchResourceAliases(): Promise<void> {
      this.resource_aliases = await apiRequest<
        ResourceAlias[],
        ResourceAlias[]
      >(resourceAliasBasePath, 'Failed to fetch resource aliases!', 'get');
    },
    async createResourceAlias(
      resource_alias: ResourceAlias,
    ): Promise<ResourceAlias> {
      const data = await apiRequest<ResourceAlias, ResourceAlias>(
        resourceAliasBasePath,
        'Failed to create resource alias!',
        'post',
        resource_alias,
      );
      this.resource_aliases.push(data);
      return data;
    },
    async updateResourceAlias(
      resource_alias: ResourceAlias,
    ): Promise<ResourceAlias> {
      const data = await apiRequest<ResourceAlias, ResourceAlias>(
        resourceAliasBasePath,
        'Failed to update resource alias!',
        'put',
        resource_alias,
      );
      for (let i = 0; i < this.resource_aliases.length; i++) {
        if (this.resource_aliases[i]?.id === resource_alias.id) {
          this.resource_aliases[i] = data;
          break;
        }
      }
      return data;
    },
    async deleteResourceAlias(resource_alias: ResourceAlias): Promise<void> {
      await apiRequest<ResourceAlias, object>(
        resourceAliasBasePath,
        'Failed to delete resource alias!',
        'delete',
        resource_alias,
      );
      this.resource_aliases = this.resource_aliases.filter(
        (ra) => ra.id !== resource_alias.id,
      );
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useNodeResourceStore, import.meta.hot),
  );
}
