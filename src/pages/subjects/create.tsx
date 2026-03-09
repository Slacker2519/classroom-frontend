import {useBack, useList} from "@refinedev/core";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {classSchema, subjectSchema} from "@/lib/schema.ts";
import {Department, Subject} from "@/types";
import * as z from "zod";
import {CreateView} from "@/components/refine-ui/views/create-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@radix-ui/react-select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Loader2} from "lucide-react";

const Create = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        refineCoreProps: {
            resource: "subjects",
            action: "create",
        }
    });

    const {
        refineCore: { onFinish },
        handleSubmit,
        formState: { isSubmitting, errors },
        control
    } = form;

    const onSubmit = async (values: z.infer<typeof subjectSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.error("Error creating subject:", error);
        }
    };

    const { query: departmentQuery } = useList<Department>({
        resource: 'departments',
        pagination: {
            pageSize: 100
        }
    });

    const departments = departmentQuery?.data?.data || [];
    const departmentsLoading = departmentQuery.isLoading;

    return (
        <CreateView className="class-view">
            <Breadcrumb />

            <h1 className="page-title">Create a Subject</h1>
            <div className="intro-row">
                <p>Provide the required information below to add a subject.</p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 front-bold text-gradient-orange">
                            Fill out form
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Subject Name <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Subject name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid sm:grid-cols-1 gap-4">
                                    <FormField
                                        control={control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(Number(value))
                                                    }
                                                    value={field.value?.toString()}
                                                    disabled={departmentsLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map((department) => (
                                                            <SelectItem
                                                                key={department.id}
                                                                value={department.id.toString()}
                                                            >
                                                                {department.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description about the subject"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    <Button type="submit" size="lg" className="w-full">
                                        {isSubmitting ? (
                                            <div className="flex gap-1">
                                                <span>Creating Subject...</span>
                                                <Loader2 className="inline-block ml-2 animate-spin" />
                                            </div>
                                        ) : (
                                            "Create Subject"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default Create
