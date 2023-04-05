// For pagination component
export const getEnvironmentValueOrDefault = (key: string, defaultValue: any): string => {
    const value: string = process.env[key] || "";

    if (!value) {
        return defaultValue;
    }

    return value;
};

export const ADD_TO_FRONT: string = "add_to_front";
export const ADD_TO_END: string = "add_to_end";
export const RESULTS_PER_PAGE: number = Number(getEnvironmentValueOrDefault("RESULTS_PER_PAGE", "20"));