import AsyncFsStorage from "@mikchan-utility/async-fs-storage";
import { ExpoFilesystem } from "./filesystem";
import { ExpoFileSystemIndex } from "./filesystem-index";

const createExpoAsyncFsStorage = (path: string, prefix?: string) => {
    const fs = new ExpoFilesystem(path);
    const fsIndex = new ExpoFileSystemIndex(fs, prefix);
    return new AsyncFsStorage(fs, fsIndex);
};

export default createExpoAsyncFsStorage;
