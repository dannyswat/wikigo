import { MouseEvent, useEffect, useState } from "react";
import { createPage, getAllPages, PageRequest } from "./pageApi";
import { HtmlEditor } from "../editors/HtmlEditor";

import "ckeditor5/ckeditor5.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../common/query";
import { clearCache, PageDropDown } from "../editors/PageDropDown";
import { IconFidgetSpinner } from "@tabler/icons-react";
import ToggleButton from "../../components/ToggleButton";

export default function NewPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const parentUrl = urlParams.get("parent");
  const [data, setData] = useState<PageRequest>(() => ({
    id: 0,
    parentId: undefined,
    url: "",
    title: "",
    shortDesc: "",
    content: "",
    isProtected: false,
    isPinned: false,
  }));
  const { data: pageList } = useQuery({
    queryKey: ["pages", true],
    queryFn: getAllPages,
  });
  const createPageApi = useMutation({
    mutationFn: (page: PageRequest) => createPage(page),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["page", data.url] });
      clearCache();
      navigate("/p" + data.url);
    },
    onError: (err, ...args) => {
      alert(err);
      console.log(args);
    },
  });

  useEffect(() => {
    if (!parentUrl) return;
    const page = pageList?.find((p) => p.url === parentUrl);
    if (page) {
      setData((prev) => ({
        ...prev,
        parentId: page.id,
        url: _generateUrl(page.id, ""),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageList]);

  function handleParentChange(parentId: number | undefined) {
    setData((prev) => {
      const state = { ...prev, parentId };
      if (parentId) state.url = _generateUrl(parentId, state.title);
      return state;
    });
  }

  function handleTitleChange(title: string) {
    setData((prev) => ({
      ...prev,
      title: title,
      url: _generateUrl(prev.parentId, title),
    }));
  }

  function _generateUrl(parentId: number | undefined, title: string) {
    if (parentId) {
      const parentUrl = pageList?.find((p) => p.id === parentId)?.url;
      return parentUrl
        ? `${parentUrl}/${generateUrl(title)}`
        : '/' + generateUrl(title);
    }
    return '/' + generateUrl(title);
  }

  function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    createPageApi.mutate({ ...data, id: 0 });
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <section className="flex flex-row items-center">
        <label className="basis-1/4">Title</label>
        <input
          className="basis-3/4 border-2 rounded-md p-2"
          type="text"
          placeholder="Title"
          value={data.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </section>
      <section className="flex flex-row items-center">
        <label className="basis-1/4">Parent Page</label>
        <PageDropDown
          className="basis-3/4 border-2 rounded-md p-2 w-full"
          value={data.parentId}
          onChange={handleParentChange}
        />
      </section>
      <section className="flex flex-row items-center">
        <label className="basis-1/4">URL</label>
        <input
          className="basis-3/4 border-2 rounded-md p-2"
          type="text"
          placeholder="URL"
          value={data.url}
          onChange={(e) =>
            setData((prev) => ({ ...prev, url: e.target.value }))
          }
        />
      </section>
      <section className="flex flex-row items-center">
        <label className="basis-1/4">Short Description</label>
        <input
          className="basis-3/4 border-2 rounded-md p-2"
          type="text"
          placeholder="Short Description"
          value={data.shortDesc}
          onChange={(e) =>
            setData((prev) => ({ ...prev, shortDesc: e.target.value }))
          }
        />
      </section>
      <section>
        <HtmlEditor
          content={data.content}
          onChange={(content) => setData((prev) => ({ ...prev, content }))}
        />
      </section>
      <section>
        <ToggleButton
          label="Protected"
          checked={data.isProtected}
          onChange={(value) =>
            setData((prev) => ({ ...prev, isProtected: value }))
          }
        />
        <ToggleButton
          label="Pinned"
          checked={data.isPinned}
          className="ms-4"
          onChange={(value) =>
            setData((prev) => ({ ...prev, isPinned: value }))
          }
        />
      </section>
      <section className="flex flex-row justify-items-end">
        <button
          disabled={createPageApi.isPending}
          onClick={handleSubmitClick}
          className="basis-1/2 sm:basis-1/6 bg-lime-700 text-white rounded-md py-2 px-5"
        >
          {createPageApi.isPending ? (
            <IconFidgetSpinner className="animate-spin mx-auto" />
          ) : (
            "Create"
          )}
        </button>
        <button
          onClick={() => {
            if (!data.content || confirm("Are you sure to leave?"))
              navigate("/");
          }}
          className="basis-1/2 sm:basis-1/6 bg-gray-700 text-white rounded-md py-2 px-5 ms-4"
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

function generateUrl(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}
