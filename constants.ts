
export const SOURCE_TEXT = `---
#擎光区/c上
*擎光区,大学城,智造*
*概述：充满朝气与梦想的年轻城区。
---
#临江大学图书馆/da4
*图书馆*
*位置：高校集群。
---
#理工大科创楼/da5
*科创楼*
**实验室,科研团队**
*描述：安保严密。
`;

export const POSITION_OPTIONS = [
    { value: 'before_char', label: '角色定义之前' },
    { value: 'after_char', label: '角色定义之后' },
    { value: 'before_chat', label: '示例消息前' },
    { value: 'after_chat', label: '示例消息后' },
    { value: 'depth_system', label: '@D @ [系统]在深度' },
    { value: 'depth_user', label: '@D @ [用户]在深度' },
    { value: 'depth_ai', label: '@D @ [AI]在深度' },
];

export const SELECTIVE_LOGIC_OPTIONS = [
    { value: 0, label: '无' },
    { value: 1, label: '与任意 (OR)' },
    { value: 2, label: '与所有 (AND)' },
    { value: 3, label: '非任意 (NOT OR)' },
    { value: 4, label: '非所有 (NOT AND)' },
];
