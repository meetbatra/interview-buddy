import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SummaryPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* <Summary /> */}
      <Card className="bg-white bg-opacity-10 backdrop-blur-md border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Interview Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <p>Summary Placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryPage;
