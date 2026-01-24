export const POSITION_STRING_TO_INT: { [key: string]: number } = {
    'before_char': 0,
    'after_char': 1,
    'depth_injection': 4,
    'before_chat': 5,
    'after_chat': 6,
};

export const POSITION_INT_TO_STRING: { [key: number]: string } = {
    0: 'before_char',
    1: 'after_char',
    4: 'depth_injection',
    5: 'before_chat',
    6: 'after_chat',
};
