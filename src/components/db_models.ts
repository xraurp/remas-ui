/* tslint:disable */

/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export enum EventType {
  task_start = 'task_start',
  task_end = 'task_end',
  other = 'other',
}
export enum NotificationType {
  task_start = 'task_start',
  task_end = 'task_end',
  grafana_resource_exceedance = 'grafana_resource_exceedance_task',
  grafana_resource_exceedance_general = 'grafana_resource_exceedance_general',
  other = 'other',
}
export enum TaskStatus {
  scheduled = 'scheduled',
  running = 'running',
  finished = 'finished',
}

export enum Unit {
  NONE = '',
  BYTES_SI = 'Bytes (SI)',
  BYTES_IEC = 'Bytes (IEC)',
}

export interface Event {
  id?: number;
  name: string;
  description?: string | null;
  time: string;
  type: EventType;
  task_id: number;
  task: Task;
  notification_id?: number | null;
  notification?: Notification;
}
export interface Group {
  id?: number;
  name: string;
  description?: string | null;
  users_share_statistics?: boolean;
  parent_id?: number | null;
  parent?: Group;
  members?: User[];
}
export interface Limit {
  id?: number | undefined;
  name: string;
  description?: string | null | undefined;
  amount: number;
  user_id?: number | null | undefined;
  group_id?: number | null | undefined;
  resource_id: number;
  node_ids: number[];
}
/**
 * Node is a computer in the cluster.
 */
export interface Node {
  id?: number;
  name: string;
  description?: string | null;
  resources?: NodeResource[];
  limits?: Limit[];
}
/**
 * Connection table for node and resource. Defines how much of a resource
 * is provided by a node (for example 2 GPUs).
 */
export interface NodeProvidesResource {
  node_id?: number;
  resource_id?: number;
  amount: number;
}
/**
 * Notification for time based events like task start/end or Grafana alerts.
 */
export interface Notification {
  id?: number;
  name: string;
  description?: string | null;
  time_offset?: number | null;
  notification_template?: string | null;
  type: NotificationType;
  default_amount?: number | null;
  owner_id?: number | null;
  owner?: User;
  resource_id?: number | null;
  resource?: Resource;
  receivers_users?: User[];
  receivers_groups?: Group[];
}
/**
 * Resource is provided by a node, like CPU, RAM, GPU, etc.
 */
export interface Resource {
  id?: number;
  name: string;
  description?: string | null;
  unit: Unit;
  nodes?: Node[];
  limits?: Limit[];
  aliases?: ResourceAlias[];
  notifications?: Notification[];
}
/**
 * Alias is an additional name for a resource, like "cpu" or "gpu".
 */
export interface ResourceAlias {
  id?: number;
  name: string;
  description?: string | null;
  resources?: Resource[];
}
/**
 * ResourceAllocation is a connection table between node, resource and task.
 * Tells how much of a resource is used by a task on a node.
 */
export interface ResourceAllocation {
  task_id?: number;
  node_id?: number;
  resource_id?: number;
  amount: number;
}

/**
 * Template for Grafana panels for given resource.
 */
export interface ResourcePanelTemplate {
  id?: number;
  template: string;
  resource_id?: number;
  resource?: Resource;
}
/**
 * Task is a job that user executes on a node.
 */
export interface Task {
  id?: number;
  name: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  status?: TaskStatus;
  owner_id?: number;
  owner?: User;
  resource_allocations?: ResourceAllocation[];
  tags?: TaskTag[];
}

export interface TaskTag {
  id?: number;
  name: string;
  description?: string | null;
  user_id?: number;
  user?: User;
  tasks?: Task[];
}

export interface User {
  id?: number;
  name?: string | null;
  surname?: string | null;
  uid: number;
  username: string;
  email: string;
  group_id?: number;
  group?: Group;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface NodeResource {
  id?: number;
  name: string;
  description?: string | null;
  amount: number;
  unit: Unit;
}

export interface GroupNotifications {
  group_id?: number | null;
  group_name?: string | null;
  notifications: Notification[];
}

// object with info about group notification is assigned to
// and notification itself
export interface AssignedNotificaion {
  group_id: number | null;
  group_name: string | null;
  notification: Notification;
}

export interface NodeSchduleRequest {
  start_time: string;
  end_time: string;
  exclude_task_id: number;
}

export interface ResourceAvailability {
  node_id: number;
  resource_id: number;
  amount: number;
  user_ids: number[]; // ids of users using this resource
}

export interface UsagePeriod {
  start_time: string;
  end_time: string;
  available_resources: ResourceAvailability[];
}

export interface TaskResponse {
  id: number;
  name: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  status: TaskStatus;
  owner?: User;
  resources?: ResourceAllocationResponse[];
  tags?: TaskTag[];
}

export interface ResourceAllocationResponse {
  node: Node;
  resource: Resource;
  amount: number;
}
