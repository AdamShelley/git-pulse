import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// const query = useQuery({ queryKey: 'comments', queryfn: () => {}});

// type responseType = responseType

export const useComments = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};
